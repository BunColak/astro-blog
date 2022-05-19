<script lang="ts">
  import { DateTime } from "luxon";
  export let url: string;
  export let title: string;
  export let releaseDate: string;
  export let tags: string[];
  export let description: string
</script>

<div class="mt-10">
  <a class="text-lg" href={`${url}`}>{title}</a>
  <div class="flex mb-4 text-sm text-gray-600 lg:mb-2">
    <div>{DateTime.fromISO(releaseDate).toLocaleString(DateTime.DATE_MED)}</div>
    <div class="flex flex-wrap justify-start">
      {#each tags as tag}
        <a class="ml-4 italic text-gray-600" href={`/tags/${tag}`}>
          #{tag}
        </a>
      {/each}
    </div>
  </div>
  <div class="mt-1 text-sm leading-snug text-gray-900 max-w-none">
    {description}
  </div>
</div>
