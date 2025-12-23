"use cache";
import books from "@/app/api/db";

export default async function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Books Collection</h1>
      <div className="grid gap-4">
        {books.map((book) => (
          <div key={book.id} className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold">{book.name}</h2>
            <p className="text-sm text-gray-600">Book ID: {book.id * 849128}</p>
          </div>
        ))}
        <hr className="m-6 text-foreground opacity-80" style={{borderRadius: "100%"}}/>
      </div>
      <div className="p-4 rounded-lg bg-background">
        <h3 className="font-bold mb-2 text-2xl">Raw Data:</h3>
        <pre className="overflow-auto border rounded-4xl p-6 text-1xl">{JSON.stringify(books, null, 2)}</pre>
      </div>
    </main>
  );
}
