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

    const filePath = `challenge_photos/${Date.now()}_${imageFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from('photos') // ensure your bucket is named 'photos'
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

    navigate('/cs278/home');
  };

  return (
    <div>
      <h2>Upload Photo and Caption to Complete Challenge</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="file"
        accept="image/*"
        capture="environment" // or "user" for front-facing camera
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
