
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { COLORS } from '../../utils/constants.js';


function VolunteerProfileDialog({
  open,
  volunteer,
  onClose,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.5rem',
          color: COLORS.primary,
        }}
      >
        Volunteer Profile
      </DialogTitle>


      <DialogContent dividers>

        {volunteer ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 2,
            }}
          >

            {/* PROFILE IMAGE */}

            <Avatar
              src={
                volunteer.profileImage ||
                undefined
              }
              alt={
                volunteer.name ||
                'Volunteer'
              }
              sx={{
                width: 110,
                height: 110,
                mb: 2,
                fontSize: '2.5rem',
                bgcolor: '#E8F5E9',
                color: '#166534',
                fontWeight: 700,
              }}
            >
              {!volunteer.profileImage &&
                volunteer.name
                  ?.charAt(0)
                  ?.toUpperCase()}
            </Avatar>


            {/* NAME */}

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: COLORS.primary,
                mb: 3,
              }}
            >
              {volunteer.name ||
                'Name not available'}
            </Typography>


            {/* PROFILE INFORMATION */}

            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >

              {/* EMAIL */}

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Email
                </Typography>

                <Typography variant="body1">
                  {volunteer.email ||
                    'Not available'}
                </Typography>
              </Box>


              {/* PHONE */}

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Phone
                </Typography>

                <Typography variant="body1">
                  {volunteer.phone ||
                    'Not available'}
                </Typography>
              </Box>


              {/* BIO */}

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  About
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.6,
                  }}
                >
                  {volunteer
                    .volunteerProfile
                    ?.bio ||
                    'No bio available'}
                </Typography>
              </Box>


              {/* SERVICE AREA */}

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Service Area
                </Typography>

                <Typography variant="body1">
                  {volunteer
                    .volunteerProfile
                    ?.serviceArea ||
                    'Not available'}
                </Typography>
              </Box>


              {/* AVAILABILITY */}

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Availability
                </Typography>

                <Typography variant="body1">
                  {volunteer
                    .volunteerProfile
                    ?.availability ||
                    'Not available'}
                </Typography>
              </Box>


              {/* INTERESTS */}

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Interests
                </Typography>

                <Typography variant="body1">
                  {Array.isArray(
                    volunteer
                      .volunteerProfile
                      ?.interests
                  )
                    ? volunteer.volunteerProfile.interests.join(
                        ', '
                      )
                    : volunteer
                        .volunteerProfile
                        ?.interests ||
                      'Not available'}
                </Typography>
              </Box>

            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary">
            Volunteer information is not available.
          </Typography>
        )}

      </DialogContent>


      <DialogActions
        sx={{
          p: 2,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
          }}
        >
          Close
        </Button>
      </DialogActions>

    </Dialog>
  );
}


export default VolunteerProfileDialog;

