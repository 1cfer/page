import React from 'react';
import './Tresd.css';
import ThreeDRotationRoundedIcon from '@mui/icons-material/ThreeDRotationRounded';

const Tresd = () => {
  const openNewTab = () => {
    window.open('https://pablojbuiles.github.io/EcoVillaVirtual/', '_blank');
};
  return (
    <div className="tresd-container">
      {/* <embed src="https://pablojbuiles.github.io/EcoVillaVirtual" style={{width: "1400px", height: "700px"}}/> */}

      <button className="open-3d-button" onClick={openNewTab}><ThreeDRotationRoundedIcon /></button>
    </div>
  );
};

export default Tresd;
