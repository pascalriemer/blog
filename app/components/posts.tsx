import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  return (
    <div className="grid gap-6">
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post, index) => (
          <div 
            key={post.slug}
            className="group hover:scale-[1.02] transition-transform"
          >
            <Link
              className="p-4 block rounded-xl transition-all border border-transparent bg-neutral-50 dark:bg-neutral-900/50 hover:border-neutral-200 dark:hover:border-neutral-800 hover:shadow-sm"
              href={`/blog/${post.slug}`}
            >
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 tabular-nums font-mono">
                    {formatDate(post.metadata.publishedAt, false)}
                  </p>
                  <div className="h-[1px] flex-grow mx-2 bg-neutral-300/50 dark:bg-neutral-700/50"></div>
                  <div className="rounded-full w-2 h-2 bg-neutral-300 dark:bg-neutral-700 group-hover:bg-blue-400 dark:group-hover:bg-blue-400 transition-colors"></div>
                </div>
                <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.metadata.title}
                </h2>
                {post.metadata.summary && (
                  <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2 text-sm mt-1">
                    {post.metadata.summary}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
    </div>
  )
}
