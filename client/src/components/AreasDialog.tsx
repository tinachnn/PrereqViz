import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

export default function AreasDialog(props : any) {
  const { current, onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value : string) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Apply this course towards:</DialogTitle>
      <List sx={{ pt: 0 }}>
        {current.areas.map((area : string) => (
          <ListItem disableGutters key={area}>
            <ListItemButton onClick={() => handleListItemClick(area)}>
              <ListItemText primary={area} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  )
}