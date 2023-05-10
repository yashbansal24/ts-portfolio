import { Text,Image, Spacer, Link, Container } from "@nextui-org/react";
import { useModal} from "@nextui-org/react";

import React from "react";
import Navigation from './components/navigation'

export default function Backend() {
  return (
    <React.Fragment>
    <Navigation />
    <Container style={{'maxWidth': '1080px', 'margin': '0 auto'}}>
    <Text css={{'textAlign': 'center', 'margin': '20px 0'}}>
        First invented by Github Copilot, prompt engineering is the process of using tools like chatGPT or Copilot to generate code snippets based on a given prompt.
        It allows us to quickly prototype and iterate on different ideas, saving us time and effort in the development process.
        For those who are not familiar with chatGPT or Github Co-pilot, they are state-of-the-art language models that can generate human-like text based on a given prompt. It has been a popular way to generate code snippets that can be built upon and incorporated into projects. 
    </Text>
    <Text h3 css={{'textAlign': 'center', 'margin': '20px 0'}}> Careers in AI </Text>
    <Spacer />
    <Text h3 css={{'textAlign': 'center', 'margin': '20px 0'}}> Node JS Prompt engineer</Text>
    <Text css={{'textAlign': 'center', 'margin': '20px 0'}}>
      A prompt engineer, in the context of natural language processing (NLP) and machine learning, is someone who designs and creates prompts that are used to train AI language models like myself. These prompts can take various forms, such as questions, statements, or incomplete phrases, and are used to guide the language model in generating relevant and coherent responses.
      The job of a prompt engineer involves designing prompts that are diverse, relevant, and representative of the language and concepts the model is meant to learn. They may also need to fine-tune and adjust the prompts based on the performance of the model during training and testing.
      In short, a prompt engineer is responsible for designing the inputs that enable AI language models like me to generate natural language responses to a wide range of queries and prompts.
    </Text>
    <Link href="https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/"> New Prompt Engineering course </Link>
    <Spacer />
    </Container>
  </React.Fragment>
  );
}