import { Text,Image, Spacer, Link } from "@nextui-org/react";
import { useModal} from "@nextui-org/react";

import React from "react";
import Navigation from './components/navigation'

export default function Backend() {
  return (
    <React.Fragment>
    <Navigation />
    <Text css={{'textAlign': 'center', 'margin': '20px 0'}}>
        First invented by Github Copilot, prompt engineering is the process of using tools like chatGPT or Copilot to generate code snippets based on a given prompt.
        It allows us to quickly prototype and iterate on different ideas, saving us time and effort in the development process.
        For those who are not familiar with chatGPT or Github Co-pilot, they are state-of-the-art language models that can generate human-like text based on a given prompt. It has been a popular way to generate code snippets that can be built upon and incorporated into projects. 
    </Text>
    <Text h3 css={{'textAlign': 'center', 'margin': '20px 0'}}> Careers in AI </Text>
    <Spacer />
    <Text h3 css={{'textAlign': 'center', 'margin': '20px 0'}}> Node JS Prompt engineer</Text>
    <Link href="https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/"> New Prompt Engineering course </Link>
    <Spacer />
  </React.Fragment>
  );
}