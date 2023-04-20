import { Text,Image, Spacer } from "@nextui-org/react";
import { useModal} from "@nextui-org/react";

import React from "react";
import Navigation from './components/navigation'

export default function Backend() {
  return (
    <React.Fragment>
    <Navigation />
      <Text h4 css={{'textAlign': 'center', 'margin': '20px 0'}}> Chat GPT Prompt 1 </Text>
      <Spacer />
      <Text h4 css={{'textAlign': 'center', 'margin': '20px 0'}}> Chat GPT Prompt 2</Text>
      <Spacer />
      <Text h4 css={{'textAlign': 'center', 'margin': '20px 0'}}> Node JS Prompt engineer</Text>
      <Spacer />
    </React.Fragment>
  );
}