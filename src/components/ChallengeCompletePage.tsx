import React, { useState, useEffect } from 'react';
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
  const [challengeTitle, setChallengeTitle] = useState<string>('Loading...');

  // Fetch challenge title from database
  useEffect(() => {
    const fetchChallengeTitle = async () => {
      if (!challengeId) return;

      const { data, error } = await supabase
        .from('challenges')
        .select('title')
        .eq('id', challengeId)
        .single();

      if (error) {
        console.error('Failed to fetch challenge title:', error.message);
        setChallengeTitle('Challenge');
      } else {
        setChallengeTitle(data.title);
      }
    };

    fetchChallengeTitle();
  }, [challengeId]);

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
        content: `🎉 <b>${userName}</b> completed a challenge ${challengeId}: ${challengeTitle}!<br/>Caption: ${caption}<br/><img src="${publicUrl}" alt="Challenge Image" style="max-width: 25%;" />`,
        room,
      },
    ]);

    navigate('/home');
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif",
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: 'none',
            border: 'none',
            color: '#F9A825',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0 10px 0 0',
          }}
        >
          &lt;
        </button>
        <h2 style={{ 
          margin: '0',
          color: '#6D4C41', 
          fontWeight: 'normal',
          fontSize: '22px',
        }}>
          <span style={{ fontWeight: 'bold' }}>{challengeTitle}:</span> complete your challenge
        </h2>
      </div>

      {/* ...rest of your component remains unchanged... */}


      {imageFile ? (
        <div style={{
          position: 'relative',
          marginBottom: '20px',
        }}>
          <img 
            src={URL.createObjectURL(imageFile)} 
            alt="Preview" 
            style={{
              width: '100%',
              borderRadius: '12px',
              display: 'block',
            }}
          />
          <button 
            onClick={() => setImageFile(null)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: '#FF5722',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div style={{
          border: '2px dashed #F9E5B5',
          borderRadius: '12px',
          padding: '30px',
          textAlign: 'center' as const,
          marginBottom: '20px',
          backgroundColor: '#FFF8E1',
        }}>
          <label style={{
            display: 'block',
            color: '#6D4C41',
            cursor: 'pointer',
          }}>
            tap to upload a photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          color: '#6D4C41', 
          fontWeight: 'normal',
          fontSize: '16px',
          marginBottom: '10px',
        }}>
          notes
        </h3>
        <textarea
          placeholder="give us (by us i mean your friends) more details about your food so that they don't cancel you!"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{
            width: '100%',
            height: '120px',
            padding: '15px',
            borderRadius: '12px',
            border: '1px solid #F9E5B5',
            backgroundColor: '#FFFFFF',
            fontSize: '16px',
            color: '#6D4C41',
            resize: 'none' as const,
            boxSizing: 'border-box' as const,
          }}
        />
      </div>

      {error && <p style={{ color: '#FF5722', marginBottom: '20px' }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={handleUpload} 
          disabled={uploading}
          style={{
            backgroundColor: '#F9A825',
            color: '#6D4C41',
            border: 'none',
            borderRadius: '30px',
            padding: '12px 50px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: !uploading ? 'pointer' : 'default',
            opacity: uploading ? 0.7 : 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {uploading ? 'uploading...' : 'submit'}
        </button>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        height: '60px',
        backgroundColor: '#F5F5F5',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/pizza-icon.png" alt="Pizza" style={{ height: '30px' }} />
        </div>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <img src="/bowl-icon.png" alt="Bowl" style={{ height: '30px' }} />
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#FF5722',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
          }}>
            2
          </span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src="/chef-icon.png" alt="Chef" style={{ height: '30px' }} />
        </div>
      </div>
    </div>
  );
};

export default ChallengeCompletePage;
