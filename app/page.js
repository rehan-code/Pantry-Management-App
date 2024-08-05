'use client'

import React, { useState, useEffect, createContext } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, Alert, Snackbar, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import { useRouter } from 'next/navigation';
import { usePictureContext } from './pictureContext';
import {ImagePreview} from './camera/page.js';
import SearchBar from './components/searchBar';
import { SortByAlphaOutlined } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  // border: '2px solid #000',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home({params, searchParams}) {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(searchParams.picture == 'true' ? true : false)
  const [editOpen, setEditOpen] = useState({open: false, name:"", quantity: ""});
  const [snackbar, setSnackbar] = useState(false)
  const [sort, setSort] = useState(false)
  const [itemName, setItemName] = useState('')
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const toggleSort = () => {sort ? setSort(false) : setSort(true)}
  const handleEditOpen = (name, quantity) => setEditOpen({open: true, name:name, quantity: quantity})
  const handleEditClose = () => setEditOpen({open: false, name:"", quantity: ""})
  const {picture, setPicture} = usePictureContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");


  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }
  
  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1, picture: picture == undefined ? null : picture})
      setPicture(null);
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const editItem = async (item, newQuantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: newQuantity })

    }
    await updateInventory()
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbar(false);
  };
  
  // For snackbar
  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseSnackbar}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const filterData = (query) => {
    let inv = inventory
    sort ? inv.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
    
      // names must be equal
      return 0;
    }) : inventory

    if (!query) {
      return inv;
    } else {
      return inv.filter(({name}) => name.toLowerCase().includes(query));
    }
  };

  const dataFiltered = filterData(searchQuery);


  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <Stack width="100%" direction={'column'} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  router.push("/camera")
                }}
              >
                Add Image
              </Button>
              <ImagePreview
                image={picture}
              />
            </Stack>
            
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      {/* Edit Item  */}
      <Modal
        open={editOpen.open}
        onClose={handleEditClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            {/* <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={editOpen.name}
              onChange={(e) => handleEditOpen(e.target.value, editOpen.quantity)}
            /> */}
            <TextField
              id="outlined-basic"
              label="Quantity"
              variant="outlined"
              fullWidth
              value={editOpen.quantity}
              onChange={(e) => handleEditOpen(editOpen.name, e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                let quantity = parseInt(editOpen.quantity);
                if (!isNaN(quantity) && quantity > 0) {
                  editItem(editOpen.name, quantity);
                  handleEditClose();
                } else if (isNaN(quantity)) {
                  setSnackbar(true);
                }
              }}
            >
              Edit
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Enter a valid number"
        action={action}
      />

      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Box border= '6px solid lightblue' borderRadius={4}>
        <Box
          width="1000px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          sx={{borderTopLeftRadius:10, borderTopRightRadius:10}}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'} >
            Inventory Items
          </Typography>
        </Box>
        <Box width="1000px" height="80px" display={'flex'} justifyContent={'space-evenly'} alignItems={'center'}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <Button variant={sort ? 'contained' : 'outlined'} onClick={toggleSort}><SortByAlphaOutlined/></Button>
        </Box>
        <Stack width="1000px" height="600px" spacing={2} overflow={'auto'} sx={{borderBottomLeftRadius:10, borderBottomRightRadius:10}}>
          {dataFiltered.map(({name, quantity, picture}) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
            >
              <ImagePreview
                image={picture}
              />
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              <Button variant="contained" onClick={() => removeItem(name)}>
                Remove
              </Button>
              
              <Button variant="contained" onClick={() => handleEditOpen(name, quantity)}>
                Edit
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}