import React, { useState, useEffect } from 'react';

import { DateTime } from 'luxon';


import styles from './comments.module.sass'

const PhaseComments = ({ comments }) => {

  const [posts, setPosts] = useState([]);

  useEffect(() => {

    setPosts(comments.map((obj, index) => {

      let date = DateTime.fromSeconds(obj.createdAt.getTime());

      //TODO: Handle times from other months
      let time = `${date.toFormat('HH:mm')} on ${date.toFormat('cccc')}`

      return (
        <div key={index} className={styles.post}>
          <p className={styles.text}>{obj.text}</p>
          <p className={styles.author}>At {time} by {obj.name}</p>
        </div>
      )

    }))

  }, [comments])

  return (
    <div className={styles.posts}>
      {posts}
    </div>
  )

}

export default PhaseComments;
