import { Container, Grid, Navbar, Dropdown, Text, Button, Link,Image, Spacer } from "@nextui-org/react";
import { Modal, useModal} from "@nextui-org/react";

import React from "react";
import { Card1 } from './components/Card1';
import { Card2 } from './components/Card2';
import { Card3 } from './components/Card3';
import { Card4 } from './components/Card4';
import { Card5 } from './components/Card5';
import Experience from './Experience';
import { icons } from "./icons";
import { AcmeLogo } from "./Acme";
import Navigation from './components/navigation'
import Marquee from "react-fast-marquee";
import Projects from "./projects";

export default function Backend() {
  const { setVisible, bindings } = useModal();
  return (
    <React.Fragment>
    <Navigation />
      <Text h4 css={{'textAlign': 'center', 'margin': '20px 0'}}> Multiplayer Game Sync </Text>
      <Image 
      src="simple_state_sync.png"
      height={400}
      width={800} />
      <Spacer />
      <Text h4 css={{'textAlign': 'center', 'margin': '20px 0'}}> Multiplayer Game Sync with Notifications</Text>
      <Image 
      src="simple_state_sync.png"
      height={400}
      width={800} />
      <Spacer />
    </React.Fragment>
  );
}