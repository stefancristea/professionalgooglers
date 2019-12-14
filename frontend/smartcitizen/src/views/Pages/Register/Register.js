import React, { Component } from 'react';
import { Alert, Button, Card, CardBody, CardFooter, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import { Redirect } from 'react-router-dom';

class Register extends Component {

  state = {
    email: "",
    password: "",
    repeat_password: "",
    error: {
      message: "",
      type: ""
    },
    redirect: false
  }

  renderRedirect = () => {
    if (this.state.error.type == "success") {
      return <Redirect to='/login' />
    }
  }

  change=e =>
  {
      this.setState({
          [e.target.name]: e.target.value});
  };

  onSubmit =e=> {
    e.preventDefault();
    
   // this.props.onSubmit(this.state);

    let data = {
        userEmail: this.state.email,
        userPassword: this.state.password
    }
    console.log(this.state.email);
    console.log(this.state.password);
    
    var request = new Request('http://172.31.3.30:8080/registerUser' , {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    })

    var this_ = this;
    fetch(request)
      .then(function(response){
      response.json()
        .then(function(data) {
          console.log(data);
          this_.setState({error: data});
          if (this_.state.error.type == "succes")
            this_.state.redirect = true;
        })
      })

    this.setState(
        {
            email: "",
            password: "",
            repeat_password: ""
        }
        
    
  )

 
};


  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="9" lg="7" xl="6">
            <Alert color= {this.state.error.type} isOpen={this.state.error.type != null}>
                        {this.state.error.message}
                </Alert>
              <Card className="mx-4">
                <CardBody className="p-4">
                  <Form>
                    <h1>Register</h1>
                    <p className="text-muted">Create your account</p>

                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>@</InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Email" autoComplete="email" name = "email" ref = "email" value={ this.state.email } onChange={e=>this.change(e)}/>
                    </InputGroup>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="Password" autoComplete="new-password" name = "password" ref = "password" value={ this.state.password } onChange={e=>this.change(e)}/>
                    </InputGroup>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="Repeat password" autoComplete="new-password"  name = "repeat_password" ref = "repeat_password" value={ this.state.repeat_password } onChange={e=>this.change(e)}/>
                    </InputGroup>
                    {this.renderRedirect()}
                    <Button  color="success" block value="Send" disabled={!this.state.email || !this.state.password || !this.state.repeat_password || this.state.password != this.state.repeat_password} onClick={e =>this.onSubmit(e)}>Create Account</Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Register;
