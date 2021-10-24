import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import Image from 'next/image';

import Layout from 'layouts/default';

import { WarpBack } from 'helpers/systemIcons'

import { Sidebar, Breadcrumbs, Loader, CourseNavigation } from 'components';

import { Prompt } from 'helpers/prompt';


import getCookies from 'helpers/getCookiesServer.js';
import handleErrors from 'helpers/handleErrorsServer.js';

import Request from 'helpers/request.js';

import { authCheck, redirectToLogin } from 'helpers/auth.js';


import styles from './phases.module.sass';

export const getServerSideProps = async ctx => {

  if(!(await authCheck(ctx))) return redirectToLogin;

  let res = await new Request(`/api/phase/fetch/${ctx.query.phase}`, {
    parentCourse: ctx.query.id
  }).post().json().ctx(ctx).send();

  // console.log(res)

  let serverErrors = handleErrors(200, res, [404]);

  let phase = {};
  let courseInfo = {};

  if(serverErrors === false) {
    phase = res.phase;

    //fetch course name

    let request = new Request(`/api/course/fetch/${ctx.query.id}`)
      .get()
      .json()
      .ctx(ctx);
    let response = await request.send();

    serverErrors = handleErrors(200, response, [404]);

    if(serverErrors === false) {
      courseInfo = {
        name: response.course.name,
        ownerName: response.course.owner.name
      }
    }

  }

  return {
    props: {
      serverErrors,
      phase,
      courseInfo,
    },
  };
};



const Phases = ({ serverErrors, phase, courseInfo }) => {

  //TODO: track which course name is associated with this phase
  //else get it from an api call

  // console.log(phase)

  if(serverErrors !== false) {
    Prompt.error(serverErrors);
  }

  const router = useRouter();


  const [loaderActive, setLoaderActive] = useState(false);
  const [itemRenders, setItemRenders] = useState(phase.phaseItems);
  // const [itemsRender, ]

  useEffect(() => {

    console.log("jgpiaehgjpea")

    phase.phaseItems?.push({
      name: 'My item',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    })
    phase.phaseItems?.push({
      name: 'My item',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    })
    phase.phaseItems?.push({
      name: 'My item',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    })
    phase.phaseItems?.push({
      name: 'My item',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    })
    phase.phaseItems?.push({
      name: 'My item',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    })
    phase.phaseItems?.push({
      name: 'My item',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    })
    phase.phaseItems?.push({
      name: 'My item',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    })
    phase.phaseItems?.push({
      name: 'My item',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    })
    phase.phaseItems?.push({
      name: 'My item',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    })
    phase.phaseItems?.push({
      name: 'My item',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    })


    // setItems([{
    //   name: 'My item',
    //   description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla. Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum. Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue. Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.'
    // }])


  }, [])

  const navTo = (path) => {

    setLoaderActive(true)
    router.push(path)

  }

  const navOptions = [
    {
      name: courseInfo?.name,
      onClick: () => navTo(`/courses/page?id=${router.query.id}`)
    },
    {
      name: phase.name,
      selected: true,
      onClick: () => console.log("clicked phase")
    }
  ]

  useEffect(() => {

    console.log("gkeaojgae")

    setItemRenders(phase.phaseItems?.map((obj, index) => {

      return(
        <div key={index} className={styles.item}>
          <p className={styles.title}>{obj.name}</p>
          <div className={styles.hozLine}></div>
          <p className={styles.desc}>{obj.description}</p>
        </div>
      )

    }))

  }, [phase.phaseItems])


  return (
    <Layout>
      <Loader active={loaderActive} />
      <div className={styles.wrapper}>
        <Sidebar />

        <div className={styles.page}>

          <div className={styles.header}>

            <div className={styles.breadcrumbs}>
              <Breadcrumbs options={navOptions} />
            </div>

            <p className={styles.ownerName}>{`${courseInfo.ownerName?.first} ${courseInfo.ownerName?.last}`}</p>

          </div>

          <div className={styles.hozLine}></div>
          <div className={styles.verLine}></div>

          <CourseNavigation options={[
            {
              text: 'Go back',
              onClick: () => navTo(`/courses/page?id=${router.query.id}`),
              icon: WarpBack
            },
          ]} />

          <div className={styles.inner}>
            <div className={styles.content}>

              {itemRenders}

            </div>
            <div className={styles.information}>
              <p className={styles.descTitle}>Description</p>
              <p className={styles.desc}>
                {phase.description}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Aenean et tortor at risus viverra adipiscing at in. Venenatis urna cursus eget nunc scelerisque. Faucibus vitae aliquet nec ullamcorper sit. Orci nulla pellentesque dignissim enim. Massa ultricies mi quis hendrerit. Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Diam sollicitudin tempor id eu nisl nunc mi ipsum. Pulvinar etiam non quam lacus suspendisse faucibus. Pellentesque eu tincidunt tortor aliquam nulla.

                Scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Cras sed felis eget velit aliquet sagittis. Fringilla ut morbi tincidunt augue interdum velit. Pulvinar elementum integer enim neque volutpat ac. Orci a scelerisque purus semper eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque. In massa tempor nec feugiat nisl pretium. Justo nec ultrices dui sapien eget mi proin sed libero. Sed turpis tincidunt id aliquet risus feugiat in ante metus. Ultrices vitae auctor eu augue ut lectus arcu bibendum.

                Pulvinar etiam non quam lacus suspendisse faucibus. Bibendum est ultricies integer quis auctor elit sed vulputate. Ipsum faucibus vitae aliquet nec ullamcorper. Mus mauris vitae ultricies leo integer malesuada nunc. Nunc aliquet bibendum enim facilisis. Enim facilisis gravida neque convallis a cras. Magna sit amet purus gravida quis blandit turpis. Dolor sed viverra ipsum nunc aliquet bibendum enim. Commodo nulla facilisi nullam vehicula ipsum a. Venenatis cras sed felis eget. Sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper eget. Cum sociis natoque penatibus et. Quam quisque id diam vel quam elementum pulvinar etiam. Ipsum dolor sit amet consectetur. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh.

                Mus mauris vitae ultricies leo integer malesuada nunc. Feugiat nisl pretium fusce id velit. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Sagittis orci a scelerisque purus semper eget duis. Diam volutpat commodo sed egestas egestas fringilla. Etiam non quam lacus suspendisse faucibus interdum posuere. Aliquam sem et tortor consequat id porta nibh venenatis. Sagittis id consectetur purus ut. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras. Ut tristique et egestas quis ipsum. Aliquam sem et tortor consequat id porta. Ultricies mi eget mauris pharetra. Aliquam eleifend mi in nulla. In eu mi bibendum neque egestas congue.

                Arcu felis bibendum ut tristique et egestas quis ipsum. Integer enim neque volutpat ac tincidunt vitae. Blandit cursus risus at ultrices mi tempus imperdiet. Quisque id diam vel quam. Id diam vel quam elementum pulvinar etiam non. Morbi tempus iaculis urna id volutpat lacus laoreet. Venenatis tellus in metus vulputate eu scelerisque felis. Sed nisi lacus sed viverra tellus in hac. Id cursus metus aliquam eleifend. Lobortis feugiat vivamus at augue eget arcu dictum. Nisi vitae suscipit tellus mauris a diam. Semper feugiat nibh sed pulvinar proin gravida.
              </p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Phases;
