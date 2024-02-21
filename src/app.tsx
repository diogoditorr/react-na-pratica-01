import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FileDown, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { Pagination } from "./components/pagination";
import { Button } from "./components/ui/button";
import { Header } from "./components/header";
import { Tabs } from "./components/tabs";
import { Control, Input } from "./components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { useSearchParams } from "react-router-dom";
import { FormEvent, useEffect, useState } from "react";
import { useDebounceValue } from "./hooks/use-debounce-value";

export interface TagsPageQuery {
  first: number;
  prev: number | null;
  next: number;
  last: number;
  pages: number;
  items: number;
  data: Tag[];
}

export interface Tag {
  title: string;
  amountOfVideos: number;
  id: string;
}

export function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const urlFilter = searchParams.get("filter") || "";

  const [filter, setFilter] = useState(urlFilter);

  const { data: tagsResponse, isLoading } = useQuery<TagsPageQuery>({
    queryKey: ["get-tags", { page, urlFilter }],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3333/tags?_page=${page}&_per_page=10&title=${urlFilter}`
      );
      const data = await response.json();

      return data;
    },
    placeholderData: keepPreviousData,
  });

  function handleFilter(e: FormEvent) {
    e.preventDefault();

    setSearchParams((params) => {
      params.set("page", "1");
      params.set("filter", filter);

      return params;
    });
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="py-10 space-y-8">
      <div>
        <Header />
        <Tabs />
      </div>

      <main className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Tags</h1>

          <Button variant="primary">
            <Plus className="size-3" />
            Create new
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <form onSubmit={handleFilter} className="flex items-center">
            <Input variant="filter">
              <Search className="size-3" />
              <Control
                placeholder="Search tags..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Input>

            <Button type="submit">
              <Filter className="size-3" />
              Filter
            </Button>
          </form>

          <Button>
            <FileDown className="size-3" />
            Export
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableHead></TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Amount of video</TableHead>
            <TableHead></TableHead>
          </TableHeader>

          <TableBody>
            {tagsResponse?.data.map((tag) => {
              return (
                <TableRow key={tag.id}>
                  <TableCell></TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{tag.title}</span>
                      <span className="text-xs text-zinc-500">{tag.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {tag.amountOfVideos} video(s)
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {tagsResponse && (
          <Pagination
            pages={tagsResponse.pages}
            items={tagsResponse.items}
            page={page}
          />
        )}
      </main>
    </div>
  );
}