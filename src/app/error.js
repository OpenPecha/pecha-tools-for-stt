"use client"; // Error components must be Client Components

export default function Error({ error, reset }) {
  console.log("Error is", error);

  return (
    <div className="flex flex-col h-screen bg-background items-center justify-center">
      <h1 className="text-2xl font-bold">{error.message}</h1>
    </div>
  );
}
