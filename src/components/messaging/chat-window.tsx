'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { cn, formatRelativeTime } from '@/lib/utils';
import { showToast } from '@/lib/toast';


type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
};


type ConversationInfo = {
  listing: {
    id: string;
    title: string;
    images: string[];
  } | null;

  participants: {
    userId: string;
    user: {
      id: string;
      name: string | null;
    };
  }[];
};


const POLL_INTERVAL_MS = 4000;



export function ChatWindow({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {


  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] =
    useState<ConversationInfo | null>(null);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);


  const bottomRef = useRef<HTMLDivElement>(null);
  const lastFetchedAt = useRef<string | null>(null);



  const fetchMessages = useCallback(async () => {


    const url = new URL(
      `/api/messages/${conversationId}`,
      window.location.origin
    );


    if (lastFetchedAt.current) {
      url.searchParams.set(
        'after',
        lastFetchedAt.current
      );
    }



    const res = await fetch(
      url.toString()
    );


    if (!res.ok) return;


    const data = await res.json();


    setConversation(
      data.conversation
    );


    if (data.messages.length > 0) {


      lastFetchedAt.current =
        data.messages[
          data.messages.length - 1
        ].createdAt;


      setMessages((prev) => {

        if (!prev.length) {
          return data.messages;
        }


        return [
          ...prev,
          ...data.messages,
        ];

      });


    }



  }, [conversationId]);




  useEffect(() => {


    lastFetchedAt.current = null;

    setMessages([]);


    fetchMessages();



    const interval = setInterval(
      fetchMessages,
      POLL_INTERVAL_MS
    );


    return () =>
      clearInterval(interval);


  }, [fetchMessages]);




  useEffect(() => {


    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });


  }, [messages]);






  async function send(e: React.FormEvent) {
  e.preventDefault();

  if (!draft.trim()) {
    return;
  }

  setSending(true);

  const body = draft.trim();

  setDraft('');

  try {
    const res = await fetch(
      `/api/messages/${conversationId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error ?? 'Could not send message.'
      );
    }

    setMessages((prev) => [
      ...prev,
      data.message,
    ]);

    lastFetchedAt.current =
      data.message.createdAt;

    showToast({
      title: 'Message sent',
      description: 'Your message was delivered.',
    });
  } catch (err) {
    setDraft(body);

    const message =
      err instanceof Error
        ? err.message
        : 'Could not send message.';

    showToast({
      title: 'Message not sent',
      description: message,
    });
  } finally {
    setSending(false);
  }
}




  const otherName =
    conversation?.participants.find(
      (p) =>
        p.userId !== currentUserId
    )?.user.name;



  return (

    <div className="flex h-[70vh] flex-col rounded-2xl border border-border bg-card">


      <div className="flex items-center gap-3 border-b border-border p-4">


        {conversation?.listing ? (

          <>


            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">

              {conversation.listing.images[0] && (

                <Image
                  src={conversation.listing.images[0]}
                  alt=""
                  fill
                  className="object-cover"
                />

              )}

            </div>



            <div className="min-w-0">


              <p className="truncate text-sm font-medium">

                {otherName ?? 'Conversation'}

              </p>



              <Link

                href={`/listings/${conversation.listing.id}`}

                className="truncate text-xs text-branch-600 hover:underline"

              >

                {conversation.listing.title}

              </Link>


            </div>


          </>


        ) : (

          <p className="text-sm font-medium">

            {otherName ?? 'Conversation'}

          </p>

        )}


      </div>





      <div className="flex-1 space-y-3 overflow-y-auto p-4">


        {messages.length === 0 && (

          <p className="py-10 text-center text-sm text-muted-foreground">

            Say hello to start the conversation.

          </p>

        )}




        {messages.map((m) => {


          const mine =
            m.sender.id === currentUserId;



          return (

            <div

              key={m.id}

              className={cn(
                'flex',
                mine
                  ? 'justify-end'
                  : 'justify-start'
              )}

            >


              <div

                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                  mine
                    ? 'bg-branch-500 text-white'
                    : 'bg-muted text-foreground'
                )}

              >


                <p className="whitespace-pre-wrap break-words">

                  {m.body}

                </p>



                <p

                  className={cn(
                    'mt-1 text-[10px] opacity-70',
                    mine
                      ? 'text-white'
                      : 'text-muted-foreground'
                  )}

                >

                  {formatRelativeTime(
                    m.createdAt
                  )}

                </p>


              </div>


            </div>


          );


        })}



        <div ref={bottomRef} />


      </div>





      <form

        onSubmit={send}

        className="flex gap-3 border-t border-border p-4"

      >


        <textarea

          value={draft}

          onChange={(e) =>
            setDraft(e.target.value)
          }


          onKeyDown={(e) => {


            if (
              e.key === 'Enter' &&
              !e.shiftKey
            ) {

              e.preventDefault();

              send(e);

            }


          }}


          placeholder="Write a message..."


          className="
            min-h-[44px]
            flex-1
            resize-none
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
            text-sm
            outline-none
            focus:ring-2
            focus:ring-branch-500
          "

        />




        <button

          type="submit"

          disabled={
            sending ||
            !draft.trim()
          }


          className="
            rounded-xl
            bg-branch-600
            px-5
            py-3
            text-sm
            font-medium
            text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "

        >

          {sending
            ? 'Sending...'
            : 'Send'}

        </button>



      </form>


    </div>

  );

}