import React, { useState, useRef } from 'react';
import {
  Chip,
  Grid,
  Popover,
  IconButton,
  makeStyles,
  Typography,
  Theme,
} from '@material-ui/core';
import ContentCopyIcon from 'mdi-react/ContentCopyIcon';
import CopyToClipboard from 'react-copy-to-clipboard';
import clsx from 'clsx';

interface Props {
  address: string;
  textColor?: 'primary' | 'secondary';
}

export const AddressPopover: React.FC<Props> = ({
  address,
  textColor = 'primary',
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Chip
        label={address}
        className={clsx(
          classes.chip,
          textColor === 'secondary' && classes.addressSecondaryText
        )}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(!open);
        }}
        ref={anchorRef}
      />
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onBackdropClick={(event) => {
          event.stopPropagation();
          setOpen(false);
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Grid
          alignItems="center"
          spacing={1}
          container
          direction="row"
          className={classes.popoverContainer}
        >
          <Grid item>
            <Typography>{address}</Typography>
          </Grid>
          <Grid item>
            <CopyToClipboard text={address}>
              <IconButton className={classes.button}>
                <ContentCopyIcon />
              </IconButton>
            </CopyToClipboard>
          </Grid>
        </Grid>
      </Popover>
    </>
  );
};

const useStyles = makeStyles<Theme>((theme) => ({
  chip: {
    width: 200,
    borderRadius: 2,
    backgroundColor: theme.palette.background.default,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.background.default,
    },
  },
  popoverContainer: {
    padding: theme.spacing(1),
  },
  button: {
    color: theme.palette.text.primary,
    padding: 0,
  },
  addressSecondaryText: {
    color: theme.palette.text.secondary,
  },
}));