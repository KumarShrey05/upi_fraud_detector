"use client";

import { Suspense } from "react";
import SendMoneyContent from "./SendMoneyContent";

export default function SendMoneyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendMoneyContent />
    </Suspense>
  );
}