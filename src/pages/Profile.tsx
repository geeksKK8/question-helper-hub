
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import useRequireAuth from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

const Profile = () => {
  useRequireAuth(); // Redirect if not logged in
  const { user, profile, updateProfile, signOut, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    avatar_url: '',
    bio: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading || !profile) {
    return <div className="min-h-screen py-12 flex justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 w-full"></div>
          
          <div className="px-6 py-4 sm:px-8 sm:py-6 -mt-16">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 rounded-full shadow-lg">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.username} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {getInitials(profile.full_name || profile.username || user?.email || '')}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.full_name || profile.username || 'User'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button form="profile-form" type="submit">
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                    <Button variant="outline" onClick={signOut}>
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <motion.form 
                id="profile-form"
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      name="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="mt-1"
                      rows={4}
                      placeholder="Tell us a bit about yourself"
                    />
                  </div>
                </div>
              </motion.form>
            ) : (
              <div className="mt-8">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">About</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {profile.bio || 'No bio provided yet.'}
                  </p>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Information</h3>
                  
                  <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{profile.username || 'Not set'}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{user?.email}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">{profile.full_name || 'Not set'}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</dt>
                      <dd className="mt-1 text-gray-900 dark:text-white">
                        {user?.created_at 
                          ? new Date(user.created_at).toLocaleDateString() 
                          : 'Unknown'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
