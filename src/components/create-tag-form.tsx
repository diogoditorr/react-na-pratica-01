import { Check, Loader2, X } from "lucide-react";

import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createTagSchema = z.object({
  title: z.string().min(3, { message: "Minimum 3 characters." }),
  slug: z.string(),
});

type CreateTagSchemaForm = z.infer<typeof createTagSchema>;

export function CreateTagForm() {
  const { register, handleSubmit, watch, setValue, formState } =
    useForm<CreateTagSchemaForm>({
      resolver: zodResolver(createTagSchema),
      defaultValues: {
        title: "",
        slug: "",
      },
    });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async function ({ slug, title }: CreateTagSchemaForm) {
      return await fetch("http://localhost:3333/tags", {
        method: "POST",
        body: JSON.stringify({
          title,
          slug,
          amountOfVideos: 0,
        }),
      });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["get-tags"] });
    },
  });

  async function createTag(data: CreateTagSchemaForm) {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error(error);
    }
  }

  function getSlugFromString(input: string): string {
    return input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-");
  }

  return (
    <form className="w-full space-y-6" onSubmit={handleSubmit(createTag)}>
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium block">
          Tag name
        </label>
        <input
          {...register("title", {
            onChange() {
              const title = watch("title");
              const slug = title ? getSlugFromString(title) : "";

              setValue("slug", slug);
            },
          })}
          id="name"
          type="text"
          className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full"
        />
        {formState.errors.title && (
          <p className="text-sm text-red-400">
            {formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium block">
          Slug
        </label>
        <input
          {...register("slug")}
          id="slug"
          type="text"
          readOnly
          className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Dialog.Close asChild>
          <Button>
            <X className="size-3" />
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className="bg-teal-400 text-teal-950"
        >
          {formState.isSubmitting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          Save
        </Button>
      </div>
    </form>
  );
}
