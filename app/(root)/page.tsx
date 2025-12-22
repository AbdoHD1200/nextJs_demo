import { error } from "console";
import Error from "./error";

export default async function Page() {

  // const res = await fetch("https://jsonplaceholder.typicode.com/albums");
  // if (!res.ok) throw error("u piece of shit");
  // const albums: any[] = await res.json();

  return (
    <div>

      <p className="text-center">Main Page</p>
      <ul>
        {/* {
          albums.map((album: {id: number, title: string}) => (
            <li key={album.id}>
              <p>Line {album.id}:</p>
              {album.title}
              <hr className="border-r-zinc-400 border-r"/>
              </li>
          )) }*/
        }
      </ul>

    </div>
  )
}