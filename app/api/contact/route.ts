// Bismillah Ar-Rahman Ar-Roheem

import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    const db = getDB()
    await db.init()

    // Store contact message
    await db.collection("contacts").create({
      name,
      email,
      subject: subject || "General Inquiry",
      message,
      status: "unread",
      createdAt: new Date().toISOString(),
    })

    // Send email notification if configured
    if (process.env.GMAIL_USER) {
      try {
        await db.sendEmail({
          to: process.env.GMAIL_USER,
          subject: `New Contact: ${subject || "General Inquiry"}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          `,
        })
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
