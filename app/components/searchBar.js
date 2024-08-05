import { useState } from "react";
const { TextField, IconButton, InputAdornment } = require("@mui/material");
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({setSearchQuery}) => (
   <TextField
      id="search-bar"
      className="text"
      onInput={(e) => {
      setSearchQuery(e.target.value);
      }}
      label="Search"
      variant="outlined"
      InputProps={{
         endAdornment: <InputAdornment position="end"><SearchIcon/></InputAdornment>
      }}
   //  size="small"
   />
 );

 export default SearchBar;