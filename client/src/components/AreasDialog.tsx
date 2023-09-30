import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

export default function AreasDialog(props : any) {
  const { current, selectedValue, onClose, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value : string) => {
    onClose(value);
  };

  const getText = (area : string) => {
    const names : any = {
      software : 'software development breadth',
      theory : 'theory breadth',
      ai : 'artifical intelligence breadth',
      interfaces : 'interfaces breadth',
      systems : 'systems breadth',
      project : 'project course',
      technical : 'technical elective'
    };
    
    const str = area.replace(/software|theory|ai|interfaces|systems|project|technical/gi, (match : string) => names[match]);
    return str.split(' ').map((word : string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Apply this course towards:</DialogTitle>
      <List sx={{ pt: 0 }}>
        {current.areas.map((area : string) => (
          <ListItem disableGutters key={area}>
            <ListItemButton onClick={() => handleListItemClick(area)}>
              <ListItemText primary={getText(area)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  )
}