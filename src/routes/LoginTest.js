import Form from 'react-bootstrap/Form';

function FormTextExample() {
  return (
    <>
        <Form style={{position: 'relative', width : '400px',  margin : 'auto', top:'100px'}}>
      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1" >
        <Form.Label htmlSize="20">Email address</Form.Label>
        <Form.Control type="email" placeholder="name@example.com" />
      </Form.Group>
      <Form.Label htmlFor="inputPassword5">Password</Form.Label>
      <Form.Control
        type="password"
        id="inputPassword5"
        aria-describedby="passwordHelpBlock"
      />
      <Form.Text id="passwordHelpBlock" muted>
        비밀번호는 8-20자이여, contain letters and numbers,
        and must not contain spaces, special characters, or emoji.
      </Form.Text>
      </Form>
    </>
  );
}

export default FormTextExample;