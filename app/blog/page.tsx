import { Suspense } from 'react'
import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default function Page() {
  return (
    <section className="relative">
      {/* Decorative gradient background element */}
      <div 
        className="absolute top-[-100px] right-[-150px] w-[300px] h-[300px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" 
        aria-hidden="true"
      />
      
      <div className="mb-12">
        <h1 className="font-bold text-4xl mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400">
          My Blog
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Thoughts, stories, and ideas.
        </p>
      </div>
      
      <div className="relative">
        <BlogPosts />
      </div>
    </section>
  )
}
