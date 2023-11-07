import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const POST = async (request = Request) => {
  const body = await request.json();
  const { email, name, password } = body;
  try {
    await sql`CREATE TABLE IF NOT EXISTS smart_users(
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      password TEXT,
      entries INT DEFAULT 0,
      joined TEXT
      );`;

    const emailExist =
      await sql`SELECT from smart_users where email = ${email}`;

    if (emailExist.rowCount > 0)
      return NextResponse.json(
        { error: "Email already exist" },
        { status: 422 }
      );

    const hash = await bcrypt.hash(password, 10);

    const result =
      await sql`INSERt INTO smart_users(email, name, password, joined) values (${email}, ${name}, ${hash}, ${new Date()}) RETURNING *`;

    const token = jwt.sign(result.rows[0], "secretkey");

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error, message: error?.message },
      { status: 500 }
    );
  }
};
