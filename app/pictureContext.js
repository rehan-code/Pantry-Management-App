"use client";
const { createContext, useState, useContext } = require("react");

const PictureContext = createContext();

export function PictureWrapper({children}) {
   let [picture, setPicture] = useState()

   return (
      <PictureContext.Provider value={{picture, setPicture}}>
         {children}
      </PictureContext.Provider>
   )
}

export function usePictureContext() {
   return useContext(PictureContext);
}