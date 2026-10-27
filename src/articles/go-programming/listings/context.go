// select waits on several channel operations at once
func fetch(ctx context.Context, results <-chan string) (string, error) {
	select {
	case msg := <-results:
		return msg, nil
	case <-ctx.Done(): // cancelled, or the deadline passed
		return "", ctx.Err()
	}
}

// the caller sets the deadline once; every call below inherits it
ctx, cancel := context.WithTimeout(context.Background(), time.Second)
defer cancel()
msg, err := fetch(ctx, results)
