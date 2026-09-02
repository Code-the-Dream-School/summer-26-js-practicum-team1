import {
  Box,
  Container,
  Stack,
  Typography,
  Grid,
  Avatar,
  Link,
  Chip,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { COLORS } from '../utils/constants';
import deryaProfilePhoto from '../assets/derya-profile.png';

const team = [
  {
    name: 'Derya Kendircikahraman',
    role: 'Frontend / Backend',
    bio: "On the backend, I built registration APIs, volunteer profile APIs, accept/decline with notifications, and admin user detail endpoints. On the frontend, I built volunteer preferences, admin user detail, browse accept/decline actions, and dashboard alerts. The accept flow was my favorite because one volunteer's yes can change someone's day.",
    photo: deryaProfilePhoto,
    email: 'deryakendircikahraman@gmail.com',
    github: 'https://github.com/deryakendircikahraman',
    extraLinkLabel: 'Portfolio',
    extraLink: 'https://deryakendirci.vercel.app/',
  },
  {
    name: 'Emmanuel Cobian',
    role: 'Frontend / Backend',
    bio: "I worked on secure login and authentication, the volunteer browse page, and our landing and content pages. The map's clustering feature was my favorite to build because it stays intuitive and clean while still surfacing details like multiple requests from the same person, and it makes it easy to spot which areas need more help than others.",
    photo: undefined,
    email: 'emmanuel12310@berkeley.edu',
    github: 'https://github.com/EmmanuelCobian',
    extraLinkLabel: 'Portfolio',
    extraLink: 'https://emmanuelcobian.vercel.app',
  },
  {
    name: 'Team Member Name',
    role: 'Frontend / Backend',
    bio: 'Short one or two sentence bio about what this teammate focused on for Neighborhood Helper and what they enjoy building.',
    photo: undefined,
    email: 'name2@example.com',
    github: 'https://github.com/username',
    extraLinkLabel: 'Portfolio',
    extraLink: 'https://example.com',
  },
  {
    name: 'Team Member Name',
    role: 'Frontend / Backend',
    bio: 'Short one or two sentence bio about what this teammate focused on for Neighborhood Helper and what they enjoy building.',
    photo: undefined,
    email: 'name3@example.com',
    github: 'https://github.com/username',
    extraLinkLabel: 'Portfolio',
    extraLink: 'https://example.com',
  },
  {
    name: 'Team Member Name',
    role: 'Frontend / Backend',
    bio: 'Short one or two sentence bio about what this teammate focused on for Neighborhood Helper and what they enjoy building.',
    photo: undefined,
    email: 'name4@example.com',
    github: 'https://github.com/username',
    extraLinkLabel: 'Portfolio',
    extraLink: 'https://example.com',
  },
];

const mentors = [
  {
    name: 'Roy Mosby',
    role: 'Lead Mentor',
    photo: undefined,
    email: 'roy@codethedream.org',
    github: 'https://github.com/royemosby',
  },
  {
    name: 'Anastasia Nikulkina',
    role: 'Assistant Mentor',
    photo: undefined,
    email: 'nikoulkina@gmail.com',
    github: 'http://github.com/nasnik',
  },
];

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function TeamCard({ member }) {
  return (
    <Box
      sx={{
        boxShadow: 3,
        border: `1px solid transparent`,
        borderRadius: 3,
        p: 3,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'border-color 0.15s ease',
        '&:hover': {
          border: `1px solid ${COLORS.border}`,
          borderColor: COLORS.borderHover,
        },
      }}
    >
      <Avatar
        src={member.photo}
        alt={member.name}
        sx={{
          width: 88,
          height: 88,
          bgcolor: COLORS.sage,
          color: COLORS.forest,
          fontWeight: 700,
          fontSize: 24,
          mb: 2,
        }}
      >
        {!member.photo && initials(member.name)}
      </Avatar>

      <Typography sx={{ fontWeight: 700, fontSize: 18, color: COLORS.forest }}>
        {member.name}
      </Typography>
      <Chip
        label={member.role}
        size="small"
        sx={{
          mt: 1,
          mb: 2,
          bgcolor: COLORS.sage,
          color: COLORS.forest,
          fontWeight: 600,
          fontSize: 12,
        }}
      />

      <Typography
        sx={{
          fontSize: 15,
          color: COLORS.grayText,
          lineHeight: 1.6,
          mb: 2,
        }}
      >
        {member.bio}
      </Typography>

      <Stack spacing={1} sx={{ width: '100%', mt: 'auto' }}>
        {member.email && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <EmailOutlinedIcon sx={{ fontSize: 18, color: COLORS.forest }} />
            <Link
              href={`mailto:${member.email}`}
              underline="hover"
              sx={{ fontSize: 14, color: COLORS.ink }}
            >
              {member.email}
            </Link>
          </Stack>
        )}
        {member.github && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <GitHubIcon sx={{ fontSize: 18, color: COLORS.forest }} />
            <Link
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ fontSize: 14, color: COLORS.ink }}
            >
              GitHub
            </Link>
          </Stack>
        )}
        {member.extraLink && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <LaunchOutlinedIcon sx={{ fontSize: 18, color: COLORS.forest }} />
            <Link
              href={member.extraLink}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ fontSize: 14, color: COLORS.ink }}
            >
              {member.extraLinkLabel || 'Link'}
            </Link>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

function MentorCard({ mentor }) {
  return (
    <Box
      sx={{
        boxShadow: 3,
        border: `1px solid transparent`,
        borderRadius: 3,
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'border-color 0.15s ease',
        '&:hover': {
          border: `1px solid ${COLORS.border}`,
          borderColor: COLORS.borderHover,
        },
      }}
    >
      <Avatar
        src={mentor.photo}
        alt={mentor.name}
        sx={{
          width: 64,
          height: 64,
          flexShrink: 0,
          bgcolor: COLORS.sage,
          color: COLORS.forest,
          fontWeight: 700,
          fontSize: 20,
        }}
      >
        {!mentor.photo && initials(mentor.name)}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{ fontWeight: 700, fontSize: 16, color: COLORS.forest }}
        >
          {mentor.name}
        </Typography>
        <Typography sx={{ fontSize: 14, color: COLORS.grayText, mb: 1 }}>
          {mentor.role}
        </Typography>

        <Stack spacing={1}>
          {mentor.email && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <EmailOutlinedIcon sx={{ fontSize: 16, color: COLORS.forest }} />
              <Link
                href={`mailto:${mentor.email}`}
                underline="hover"
                sx={{
                  fontSize: 14,
                  color: COLORS.ink,
                  overflowWrap: 'anywhere',
                }}
              >
                {mentor.email}
              </Link>
            </Stack>
          )}
          {mentor.github && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <GitHubIcon sx={{ fontSize: 16, color: COLORS.forest }} />
              <Link
                href={mentor.github}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ fontSize: 14, color: COLORS.ink }}
              >
                GitHub
              </Link>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function ContactPage() {
  return (
    <Container sx={{ py: { xs: 5, md: 7 } }}>
      <Box sx={{ maxWidth: 640, mb: 6 }}>
        <Typography
          sx={{
            color: COLORS.forest,
            fontWeight: 600,
            fontSize: 14,
            textTransform: 'uppercase',
            mb: 2,
          }}
        >
          Get in touch
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: 30, md: 40 },
            lineHeight: 1.15,
            color: COLORS.forest,
          }}
        >
          Meet the team
        </Typography>
        <Typography
          sx={{
            mt: 2,
            fontSize: 17,
            lineHeight: 1.65,
            color: COLORS.grayText,
          }}
        >
          Neighborhood Helper is a practicum project built by a small team of
          developers learning and building together. We'd love to hear your
          feedback, answer questions, or connect. Feel free to reach out to any
          of us directly below.
        </Typography>
      </Box>

      <Grid
        container
        spacing={4}
        sx={{ justifyContent: 'center', alignItems: 'stretch' }}
      >
        {team.map((member) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={member.name + member.email}
            sx={{ display: 'flex' }}
          >
            <TeamCard member={member} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: { xs: 7, md: 9 } }}>
        <Box sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center', mb: 4 }}>
          <Typography
            sx={{
              color: COLORS.forest,
              fontWeight: 600,
              fontSize: 14,
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            With thanks to
          </Typography>
          <Typography
            sx={{ fontWeight: 700, fontSize: 28, color: COLORS.forest }}
          >
            Our mentors
          </Typography>
          <Typography sx={{ mt: 2, fontSize: 16, color: COLORS.grayText }}>
            This practicum wouldn't have been possible without the guidance and
            support of our mentors.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {mentors.map((mentor) => (
            <Grid
              size={{ xs: 12, sm: 6 }}
              key={mentor.name + mentor.email}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <MentorCard mentor={mentor} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default ContactPage;
