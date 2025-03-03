import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  EmojiEvents,
  DirectionsRun,
} from '@mui/icons-material';
import { ActivityFeedItem } from '../../types';
import { SocialService } from '../../services/SocialService';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

interface ActivityFeedProps {
  userId?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ userId }) => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const newActivities = await SocialService.getActivityFeed(page);
      if (newActivities.length === 0) {
        setHasMore(false);
      } else {
        setActivities((prev) => [...prev, ...newActivities]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
    setLoading(false);
  };

  const handleLike = async (activityId: string) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    const success = activity.hasLiked
      ? await SocialService.unlikeActivity(activityId)
      : await SocialService.likeActivity(activityId);

    if (success) {
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activityId
            ? {
                ...a,
                likes: a.hasLiked ? a.likes - 1 : a.likes + 1,
                hasLiked: !a.hasLiked,
              }
            : a
        )
      );
    }
  };

  const handleShare = async (activityId: string) => {
    // Open share dialog with multiple platform options
    const platforms: Array<'facebook' | 'twitter' | 'instagram'> = [
      'facebook',
      'twitter',
      'instagram',
    ];
    // For demo, just share to first platform
    await SocialService.shareActivity(activityId, platforms[0]);
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderActivityContent = (activity: ActivityFeedItem) => {
    switch (activity.type) {
      case 'run':
        return (
          <>
            {activity.run?.route && activity.run.route.length > 0 && (
              <Box sx={{ height: 200, width: '100%', mb: 2 }}>
                <MapContainer
                  style={{ height: '100%', width: '100%' }}
                  center={[activity.run.route[0].lat, activity.run.route[0].lng]}
                  zoom={13}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Polyline
                    positions={activity.run.route.map((point) => [
                      point.lat,
                      point.lng,
                    ])}
                    color="blue"
                  />
                </MapContainer>
              </Box>
            )}
            <Typography variant="body1" gutterBottom>
              Distance: {activity.run?.distance.toFixed(2)} km
            </Typography>
            <Typography variant="body1" gutterBottom>
              Duration: {activity.run && formatDuration(activity.run.duration)}
            </Typography>
            <Typography variant="body1">
              Pace: {activity.run?.pace.toFixed(2)} min/km
            </Typography>
          </>
        );

      case 'achievement':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmojiEvents color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6">{activity.achievement?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {activity.achievement?.description}
              </Typography>
            </Box>
          </Box>
        );

      case 'milestone':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <DirectionsRun sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              New Milestone Reached!
            </Typography>
            <Typography variant="body1">
              {activity.achievement?.description}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
      {activities.map((activity) => (
        <Card key={activity.id} sx={{ mb: 2 }}>
          <CardHeader
            avatar={
              <Avatar
                src={activity.profilePicture}
                alt={activity.username}
              />
            }
            title={activity.username}
            subheader={new Date(activity.timestamp).toLocaleString()}
          />
          <CardContent>{renderActivityContent(activity)}</CardContent>
          <Divider />
          <CardActions disableSpacing>
            <IconButton
              onClick={() => handleLike(activity.id)}
              color={activity.hasLiked ? 'primary' : 'default'}
            >
              {activity.hasLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="body2">{activity.likes}</Typography>
            <IconButton>
              <Comment />
            </IconButton>
            <Typography variant="body2">{activity.comments}</Typography>
            <IconButton onClick={() => handleShare(activity.id)}>
              <Share />
            </IconButton>
          </CardActions>
        </Card>
      ))}
      {hasMore && (
        <Button
          variant="outlined"
          fullWidth
          onClick={loadActivities}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </Box>
  );
};

export default ActivityFeed;
