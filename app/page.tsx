import { BlogPosts } from 'app/components/posts'
import DynamicQuote from 'app/components/DynamicQuote'
import { getRandomQuote } from 'app/services/quoteService'

// Server component that fetches the initial quote
export default async function Page() {
  // By setting cache: 'no-store', we ensure this runs on every request
  // This way we get a new quote on every page load
  const initialQuote = await getRandomQuote({ cache: 'no-store' });
  
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold tracking-tighter">
        Pascal Riemer
      </h1>
      
      {/* Short biography */}
      <div className="mb-8 prose dark:prose-invert prose-neutral">
        <p className="text-neutral-700 dark:text-neutral-300">
          Just a guy who likes to build stuff. Love open source, self-hosting and the web. Always learning. Always on a sidequest.
        </p>
      </div>
      
      {/* Pass the initial quote to the client component */}
      <DynamicQuote initialQuote={initialQuote} />

      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
