import { NextResponse } from "next/server";

export default function apiSecurity(req, res, next) {
  const { headers } = req;
  const referrer = headers.referer || headers.referrer || "";

  // Allow requests without Origin header when from the base URL
  const allowedReferrers = ["http://localhost:3000"];

  if (allowedReferrers.some((ref) => referrer.startsWith(ref))) {
    return next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
