import { Container, Grid, Navbar, Dropdown, Text, Button, Link,Image } from "@nextui-org/react";
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
      <div style={{'margin': '0 auto', 'width': '800px', 'height': '600px'}}>
        <iframe  src="https://excalidraw.com/" width={800} height={600}></iframe>
      </div>
    </React.Fragment>
  );
}