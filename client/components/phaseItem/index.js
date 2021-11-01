import React, { useEffect, useState } from 'react';

import styles from './phaseItem.module.sass';

import {
  Request
} from 'helpers';

import {
  Loader
} from 'components';

const PhaseItem = ({ id }) => {

  //TODO: remove all data props from initial state
  const [data, setData] = useState({
    name: 'My Item',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
  });
  const [loaderActive, setLoaderActive] = useState(false);


  useEffect(() => {

    //make api call to gather data

    // let request = new Request(`/api/phaseItems/fetch/`)
    //   .get()
    //   .json()
    //   .ctx(ctx);
    // let res = await request.send();

    // setLoaderActive(true);



    // setLoaderActive(false);

  }, [])

  return(
    <div className={styles.wrapper}>
      <Loader active={loaderActive} className={styles.loader} />

      <p className={styles.title}> {data.name}</p>
      { data.description &&
        <>
          <p className={styles.descTitle}>Description</p>
          <p className={styles.desc}>{data.description}</p>
        </>
      }

    </div>
  )

}

export default PhaseItem;
