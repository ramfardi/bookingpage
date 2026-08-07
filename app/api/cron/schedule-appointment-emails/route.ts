export const runtime =
  "nodejs";


import {
  ensureAppointmentEmails,
  type AppointmentAutomationRow,
} from "@/app/lib/appointmentEmailScheduler";


import {
  getSupabase,
} from "@/app/lib/supabase";


const supabase =
  getSupabase();


const DAY_MS =
  24 *
  60 *
  60 *
  1000;


/*
 * Same safety margin used in the scheduler.
 */
const SCHEDULE_WINDOW_MS =
  29 *
  DAY_MS;


export async function GET(
  request: Request
) {
  /* ===================================================
     SECURITY
  =================================================== */

  const authorization =
    request.headers.get(
      "authorization"
    );


  if (
    !process.env.CRON_SECRET ||
    authorization !==
      `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response(
      "Unauthorized",
      {
        status: 401,
      }
    );
  }


  const now =
    new Date();


  const cutoff =
    new Date(
      now.getTime() +
      SCHEDULE_WINDOW_MS
    );


  /*
   * Appointments whose reminder has now entered
   * Resend's scheduling window.
   */
  const {
    data:
      reminderRows,

    error:
      reminderError,
  } =
    await supabase
      .from(
        "booking_appointments"
      )
      .select("*")
      .is(
        "reminder_resend_id",
        null
      )
      /*
       * No reminder after appointment has started.
       */
      .gt(
        "appointment_at",
        now.toISOString()
      )
      .lte(
        "reminder_at",
        cutoff.toISOString()
      )
      .limit(
        100
      );


  if (
    reminderError
  ) {
    console.error(
      "Daily reminder scheduling lookup failed:",
      reminderError
    );
  }


  /*
   * Review emails that have entered the scheduling window.
   */
  const {
    data:
      reviewRows,

    error:
      reviewError,
  } =
    await supabase
      .from(
        "booking_appointments"
      )
      .select("*")
      .is(
        "review_resend_id",
        null
      )
      .lte(
        "review_at",
        cutoff.toISOString()
      )
      .limit(
        100
      );


  if (
    reviewError
  ) {
    console.error(
      "Daily review scheduling lookup failed:",
      reviewError
    );
  }


  /*
   * Combine the two lists so an appointment only needs
   * to be processed once.
   */
  const appointments =
    new Map<
      string,
      AppointmentAutomationRow
    >();


  for (
    const row
    of reminderRows || []
  ) {
    appointments.set(
      row.event_uid,
      row as AppointmentAutomationRow
    );
  }


  for (
    const row
    of reviewRows || []
  ) {
    appointments.set(
      row.event_uid,
      row as AppointmentAutomationRow
    );
  }


  let processed =
    0;


  let failed =
    0;


  for (
    const appointment
    of appointments.values()
  ) {
    try {
      await ensureAppointmentEmails(
        appointment
      );

      processed +=
        1;
    } catch (
      error
    ) {
      failed +=
        1;

      console.error(
        "Daily appointment scheduling error:",
        {
          eventUID:
            appointment.event_uid,

          error,
        }
      );
    }
  }


  return Response.json({
    success:
      true,

    checkedAt:
      now.toISOString(),

    found:
      appointments.size,

    processed,

    failed,
  });
}