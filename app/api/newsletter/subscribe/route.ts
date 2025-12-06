import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if already subscribed
    const subscribers = await db.collection("subscribers").getAll()
    const existingSubscriber = subscribers.find((sub: any) => sub.email.toLowerCase() === email.toLowerCase())

    if (existingSubscriber) {
      return NextResponse.json({ message: "Already subscribed" })
    }

    // Add new subscriber
    await db.collection("subscribers").create({
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
      status: "active",
    })

    return NextResponse.json({ message: "Subscribed successfully" })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
