<script>
  export let posts;

  $: sortedPosts = posts
    .sort((p1, p2) => new Date(p2).getDate() - new Date(p1).getDate())
    .slice(0, 3);
</script>

<div>
  <h2 class="my-16 text-5xl text-center text-bold">Latest Posts</h2>
  <div class="relative h-24 overflow-hidden">
    <div class="absolute top-0 left-0 flex h-24 items w-[300%]">
      {#each sortedPosts as post}
        <div class="w-[10%]">
          <a class="text-lg" href={post.url}>{post.title}</a>
        </div>
      {/each}
      {#each sortedPosts as post}
        <div class="w-[10%]">
          <a class="text-lg" href={post.url}>{post.title}</a>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .items {
     animation: slideshow 30s linear infinite
  }

  @keyframes slideshow {
    0% {
      left: 0;
    }
    100% {
      left: -90%;
    }
  }
</style>
