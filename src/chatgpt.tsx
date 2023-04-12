import { Text,Image, Spacer } from "@nextui-org/react";
import { useModal} from "@nextui-org/react";

import React from "react";
import Navigation from './components/navigation'

export default function Backend() {
  const { setVisible, bindings } = useModal();
  return (
    <React.Fragment>
    <Navigation />
      <Text h4 css={{'textAlign': 'center', 'margin': '20px 0'}}> Chat GPT Prompt 1 </Text>
      <Image 
      src="simple_state_sync.png"
      height={400}
      width={800} />
      <Spacer />
      <Text h4 css={{'textAlign': 'center', 'margin': '20px 0'}}> Chat GPT Prompt 2</Text>
      <Image 
      src="simple_state_sync.png"
      height={400}
      width={800} />
      <Spacer />
    </React.Fragment>
  );
}