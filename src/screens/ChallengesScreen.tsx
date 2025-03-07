import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  AvatarGroup
} from '@mui/material';
import {
  EmojiEvents,
  DirectionsRun,
  Group,
  Timer,
  TrendingUp,
  Public,
  LocalFireDepartment,
  Flag,
  Add
} from '@mui/icons-material';

const challenges = [
  {
    id: 1,
    title: "March Distance Challenge",
    type: "Monthly",
    goal: "Run 100km in March",
    progress: 45,
    participants: 1234,
    daysLeft: 12,
    reward: "Gold Medal",
    joined: true
  },
  {
    id: 2,
    title: "Weekend Warrior",
    type: "Weekly",
    goal: "Complete 3 runs this weekend",
    progress: 33,
    participants: 567,
    daysLeft: 5,
    reward: "Silver Medal",
    joined: false
  },
  {
    id: 3,
    title: "Speed Demon",
    type: "Special",
    goal: "Run 5K under 25 minutes",
    progress: 0,
    participants: 890,
    daysLeft: 30,
    reward: "Bronze Medal",
    joined: false
  }
];

const leaderboard = [
  {
    id: 1,
    name: "Sarah J.",
    distance: 82.5,
    avatar: "S"
  },
  {
    id: 2,
    name: "Mike R.",
    distance: 75.2,
    avatar: "M"
  },
  {
    id: 3,
    name: "Emma W.",
    distance: 68.9,
    avatar: "E"
  }
];

const achievements = [
  {
    id: 1,
    title: "Early Bird",
    description: "Complete 5 morning runs",
    progress: 60,
    icon: <DirectionsRun />,
    unlocked: false
  },
  {
    id: 2,
    title: "Speed Demon",
    description: "Run 1km under 4 minutes",
    progress: 100,
    icon: <TrendingUp />,
    unlocked: true
  },
  {
    id: 3,
    title: "Marathon Finisher",
    description: "Complete a full marathon",
    progress: 0,
    icon: <Flag />,
    unlocked: false
  }
];

export default function ChallengesScreen() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">Challenges & Achievements</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {}}
        >
          Create Challenge
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Active Challenges" />
          <Tab label="Achievements" />
          <Tab label="Leaderboard" />
        </Tabs>
      </Paper>

      {/* Content */}
      {tabValue === 0 && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Grid container spacing={2}>
            {challenges.map((challenge) => (
              <Grid item xs={12} key={challenge.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">{challenge.title}</Typography>
                      <Chip
                        icon={<Timer />}
                        label={`${challenge.daysLeft} days left`}
                        color="warning"
                        size="small"
                      />
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      {challenge.goal}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip icon={<Group />} label={`${challenge.participants} participants`} size="small" />
                      <Chip icon={<EmojiEvents />} label={challenge.reward} size="small" />
                      <Chip icon={<Public />} label={challenge.type} size="small" />
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress: {challenge.progress}%
                      </Typography>
                      <LinearProgress variant="determinate" value={challenge.progress} />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant={challenge.joined ? "outlined" : "contained"}
                      fullWidth
                      startIcon={challenge.joined ? <DirectionsRun /> : <Add />}
                    >
                      {challenge.joined ? "View Details" : "Join Challenge"}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Grid container spacing={2}>
            {achievements.map((achievement) => (
              <Grid item xs={12} sm={6} key={achievement.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: achievement.unlocked ? 'primary.main' : 'action.disabled',
                          mr: 2
                        }}
                      >
                        {achievement.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{achievement.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {achievement.description}
                        </Typography>
                      </Box>
                    </Box>
                    {!achievement.unlocked && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Progress: {achievement.progress}%
                        </Typography>
                        <LinearProgress variant="determinate" value={achievement.progress} />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tabValue === 2 && (
        <Box sx={{ flex: 1 }}>
          {/* Monthly Challenge */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>March Distance Challenge</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Your Position</Typography>
                <Typography variant="h4" color="primary">#4</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Your Distance</Typography>
                <Typography variant="h4" color="primary">65.3km</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Goal</Typography>
                <Typography variant="h4">100km</Typography>
              </Box>
            </Box>
            <LinearProgress variant="determinate" value={65} sx={{ mb: 2 }} />
          </Paper>

          {/* Leaderboard */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Top Runners</Typography>
            <List>
              {leaderboard.map((user, index) => (
                <ListItem key={user.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: index === 0 ? 'warning.main' : 'primary.main' }}>
                      {user.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={`${user.distance}km`}
                  />
                  {index === 0 && <EmojiEvents color="warning" />}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
