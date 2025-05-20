import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface ChallengeCompletePageProps {
  userId: string;
}

const ChallengeCompletePage: React.FC<ChallengeCompletePageProps> = ({ userId }) => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!imageFile || !caption.trim()) {
      setError('Please provide both an image and a caption.');
      return;
    }

    setUploading(true);
    setError(null);

    const sanitizeFileName = (name: string) => {
      return name
        .normalize("NFKD")
        .replace(/[^\w.-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
    };

    const filePath = `challenge_photos/${Date.now()}_${sanitizeFileName(imageFile.name)}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, imageFile);

    if (uploadError) {
      setError('Image upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from('user_challenges').insert([
      {
        user_id: userId,
        challenge_id: parseInt(challengeId!),
        photo_path: filePath,
        caption: caption.trim(),
      },
    ]);

    if (dbError) {
      setError('Failed to mark challenge complete: ' + dbError.message);
      setUploading(false);
      return;
    }

    // 🧩 Fetch user's room **and name** from profile table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('room, name')
      .eq('id', userId)
      .single();

    if (profileError || !profileData?.room || !profileData?.name) {
      console.error('Failed to fetch user profile:', profileError?.message);
      setUploading(false);
      return;
    }

    const room = profileData.room;
    const userName = profileData.name;

    const publicUrl = supabase.storage.from('photos').getPublicUrl(filePath).data.publicUrl;

    await supabase.from('messages').insert([
      {
        user_name: 'System',
        content: `🎉 <b>${userName}</b> completed a challenge!<br/>Caption: ${caption}<br/><img src="${publicUrl}" alt="Challenge Image" style="max-width: 25%;" />`,
        room,
      },
    ]);

    navigate('/home');
  };

  return (
    <div>
      <h2>Upload Photo and Caption to Complete Challenge</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />
      <br />
      <textarea
        placeholder="Enter caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <br />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Submit & Complete'}
      </button>
    </div>
  );
};

export default ChallengeCompletePage;
