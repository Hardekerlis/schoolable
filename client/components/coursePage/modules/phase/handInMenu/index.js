import React, { useEffect, useState } from 'react';

import {
  Checkbox,
  CheckboxChecked,
  Document,
  Trash
} from 'helpers/systemIcons';

import {
  Logger,
  IconRenderer,
  firstLetterToUpperCase,
  Prompt,
  Request
} from 'helpers';

const logger = new Logger('/coursePage/modules/handInMenu/index.js');


import styles from './menu.module.sass';

const FileInput = ({ maxFiles, getFiles }) => {

  const [files, setFiles] = useState([]);
  const [fileRenders, setFileRenders] = useState([]);
  const [noFiles, setNoFiles] = useState(true);

  const inputChange = (evt) => {

    let arr = files.slice();

    let filesArray = Array.from(evt.target.files);

    let newFilesAmt = filesArray.length;

    //TODO: Bug test this, heavily.

    if(newFilesAmt + arr.length > maxFiles) {
      Prompt.error("Cannot upload more than " + maxFiles + " files.")
      return;
    }

    let newFiles = filesArray.slice(filesArray.length - newFilesAmt, filesArray.length);

    let newFilesArray = arr.concat(newFiles);

    filesUpdate(newFilesArray);

  }

  const removeFile = (index) => {

    let arr = files.slice();
    arr.splice(index, 1);

    filesUpdate(arr);

  }


  const filesUpdate = (newFiles) => {

    setFiles(newFiles);

    if(newFiles.length !== 0) {
      setNoFiles(false);
    }else {
      setNoFiles(true);
    }

    if(getFiles) getFiles(newFiles);

  }

  useEffect(() => {

    setFileRenders(files.map((obj, index) => {

      return (
        <div onClick={() => removeFile(index)} key={index} className={styles.file}>
          <IconRenderer icon={Document} className={styles.icon} />
          <p className={styles.name}>{obj.name}</p>
          <div className={styles.delete}>
            <IconRenderer icon={Trash} className={styles.trash} />
          </div>
        </div>
      )

    }))

  }, [files])

  return (
    <div className={(noFiles) ? `${styles.fileInput} ${styles.noFiles}` : `${styles.fileInput} ${styles.hasFiles}`}>
      <input onChange={inputChange} type="file" id="actual-upload-input" hidden multiple />
      <label htmlFor="actual-upload-input"><p><span>Choose a file</span>or drag it here.</p></label>
      <div className={styles.uploadedFiles}>
        {fileRenders}
      </div>
    </div>
  )

}

const HandInMenu = ({ types, phaseRef, className }) => {

  const [typeRenders, setTypeRenders] = useState([]);
  const [selected, setSelected] = useState(0);

  const [menuWrapperWidth, setMenuWrapperWidth] = useState(0);

  const selectType = (index) => {
    if(index === selected) return;

    setSelected(index);

  }

  useEffect(() => {

    if(!types) return;

    let list = [];
    setTypeRenders(types.forEach(name => {
      const len = list.length;
      if(name === 'googleDrive') name = 'Google Drive'
      list.push(
        <div key={len} className={(selected === len) ? `${styles.togglerParent} ${styles.selected}` : styles.togglerParent}>
          <div onClick={() => selectType(len)} className={styles.toggler}>
            {selected === len ?
                <IconRenderer icon={CheckboxChecked} className={styles.box} />
              :
                <IconRenderer icon={Checkbox} className={styles.box} />
            }
            <p className={styles.text}>{firstLetterToUpperCase(name)}</p>
          </div>
        </div>
      )
    }))
    setTypeRenders(list);

  }, [types, selected])

  const waitFor = async(ms) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms)
    })
  }

  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    if(typeof window === 'undefined') return;
    logger.log("adding resize listener");
    window.addEventListener('resize', () => {
      let width = window.innerWidth || window.outerWidth;
      setWindowWidth(width);
    })
  }, [])

  useEffect(async() => {
    //calculate menuWrapper width.

    if(!phaseRef.current) return;


    const getPhaseWidth = () => {
      return phaseRef.current.getBoundingClientRect().width;
    }

    if(getPhaseWidth() === 0) {
      //has to wait for animation
      await waitFor(210)
    }

    //0.42 = 42%
    let width = Math.floor(getPhaseWidth()) * 0.42;

    //-10 = margin-left 10
    setMenuWrapperWidth(width - 10);

  }, [phaseRef.current, types, windowWidth])


  const [files, setFiles] = useState([]);

  const getFiles = _files => {
    setFiles(_files)
  }

  const uploadClick = () => {
    let data = {};

    if(types[selected] === 'file') {

      if(files.length === 0) {
        Prompt.error("No files selected.");
        return;
      }

      data = files;

      Request().client
        .post
        .body(data)

    }


  }

  return (
    <div className={(className) ? `${styles.handInMenu} ${className}` : styles.handInMenu}>
      <div style={{width: `${menuWrapperWidth}px`}} className={styles.menuWrapper}>
        <p className={styles.title}>Hand in</p>
        <div className={styles.board}>
          {typeRenders}
        </div>
        {types &&
          <>
            {types[selected] === 'file' &&
              <div className={styles.container}>
                <FileInput getFiles={getFiles} maxFiles={5} />
                <p className={styles.maxFiles}>Max 5 files</p>
              </div>
            }
          </>
        }
        <div className={styles.container}>
          <div onClick={uploadClick} className={styles.submit}>
            <p>Upload</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HandInMenu;
