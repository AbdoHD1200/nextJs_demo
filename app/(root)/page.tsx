  "use cache";


  import { cacheLife } from "next/cache"

// import { error } from "console";
// import Error from "./error";

export default async function Page() {
  cacheLife("hours");
  const res = await fetch("https://jsonplaceholder.typicode.com/albums");
  // if (!res.ok) throw error("u piece of shit");
  const albums: any[] = await res.json();

  const mappingLogos = (i: number) => {
  const logos: string[] = ["vercel", "next", "globe", "file", "window"];
  if (i > 4) {
    return `@/public/${logos[i - 4]}`;
  }

    return `@/public/${logos[i]}`;
  }
  return (
    <div>

      <p className="text-center">Main Page</p>
      <ul>
        {   
          albums.map((album: {id: number, title: string}, index: number) => (
            <li key={album.id} className="m-8">
              <p>Line {album.id}:<br/>{album.title}</p>
              <svg className="w-2xl h-1xl m-5" style={{borderRadius: "18px"}} href={mappingLogos(index)}></svg>
              
              <hr className="border-r-zinc-400 border-r" style={{borderRadius: "100%"}}/>
              </li>
          )) 
        }
      </ul>

    </div>
  )
}