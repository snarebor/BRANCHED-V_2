'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AvatarUploader } from '@/components/profile/avatar-uploader';

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const userId = (session?.user as { id?: string } | undefined)?.id;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/profile/me');

        if (!res.ok) {
          setError('Could not load your profile.');
          return;
        }

        const data = await res.json();

        setName(data.user.name ?? '');
        setBio(data.user.bio ?? '');
        setLocation(data.user.location ?? '');
        setImage(data.user.image ?? null);
      } catch {
        setError('Could not load your profile.');
      }
    }

    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          bio,
          location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setSaving(false);
        return;
      }

      await update();

      setSaved(true);

      if (userId) {
        router.replace(`/profile/${userId}`);
        router.refresh();
        return;
      }

      setSaving(false);
      setError('Profile saved, but we could not open your profile.');
    } catch {
      setSaving(false);
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="container max-w-lg py-10">
      <h1 className="font-display text-2xl font-semibold text-branch-900">
        Edit profile
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        This information is shown on your public profile.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-6">
        <AvatarUploader
          image={image}
          name={name}
          onChange={setImage}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>

          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={80}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>

          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={120}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="bio">Bio</Label>

          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        {saved && (
          <p className="text-sm text-branch-600">
            Profile updated.
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>

          {userId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/profile/${userId}`)}
              disabled={saving}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}