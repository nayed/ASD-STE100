// a custom error type carries structured detail
type ParseError struct {
	Line int
	Msg  string
}

func (e *ParseError) Error() string {
	return fmt.Sprintf("line %d: %s", e.Line, e.Msg)
}

// errors.As finds the first error of that type in the chain
var pe *ParseError
if errors.As(err, &pe) {
	fmt.Println("fix line", pe.Line)
}
