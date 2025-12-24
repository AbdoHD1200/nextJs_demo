import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";

const events = [
  { 
    image: '/images/event1.png',
    title: 'Event 1',
    slug: 'event-1',
    location: 'location-1',
    date: 'date-1',
    time: 'time-1',
  },
  {
    image: '/images/event2.png', 
    title: 'Event 2',
    slug: 'event-2',
    location: 'location-2',
    date: 'date-2',
    time: 'time-2',
  },
]

export default function Page() {

  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br /> Event You Can't Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>
      <ExploreBtn />
      <div className="mt-20 spcae-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {events.map(e => (
            <li key={e.title}>
              <EventCard {...e}/>
            </li>
          ))}
        </ul>
      </div>

    </section>
  )
}