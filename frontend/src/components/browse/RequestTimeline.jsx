import { Stepper, Step, StepLabel, Typography, Box } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { COLORS } from '../../utils/constants';

function formatStepDate(iso) {
  if (!iso) return '';

  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function RequestTimeline({ status, createdAt, acceptedAt, completedAt }) {
  const isCancelled = status === 'CANCELLED';
  const isCompleted = status === 'COMPLETED';
  const cancelledAfterAccept = isCancelled && !!acceptedAt;
  const steps = isCancelled
    ? cancelledAfterAccept
      ? [
          { label: 'Posted', date: createdAt },
          { label: 'Accepted', date: acceptedAt },
          { label: 'Cancelled', cancelled: true },
        ]
      : [
          { label: 'Posted', date: createdAt },
          { label: 'Cancelled', cancelled: true },
        ]
    : [
        { label: 'Posted', date: createdAt },
        { label: 'Accepted', date: acceptedAt },
        { label: 'Completed', date: completedAt },
      ];

  const activeStep = isCancelled
    ? steps.length - 1
    : ({ PENDING: 0, ACCEPTED: 1, COMPLETED: 2 }[status] ?? 0);

  return (
    <Box sx={{ mt: 3, mb: 1 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          ...(isCancelled && {
            '& .MuiStepConnector-line': {
              borderColor: COLORS.border,
            },

            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
              borderColor: COLORS.cancelled,
            },
          }),
        }}
      >
        {steps.map((step, index) => {
          const isCancelledStep = step.cancelled;

          return (
            <Step
              key={step.label}
              completed={
                !isCancelledStep && (isCompleted || index < activeStep)
              }
            >
              <StepLabel
                icon={
                  step.cancelled ? (
                    <CancelOutlinedIcon
                      sx={{
                        color: COLORS.cancelled,
                        fontSize: 24,
                      }}
                    />
                  ) : undefined
                }
                optional={
                  step.date ? (
                    <Typography
                      variant="caption"
                      sx={{ color: COLORS.textFaint }}
                    >
                      {formatStepDate(step.date)}
                    </Typography>
                  ) : null
                }
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}

export default RequestTimeline;
