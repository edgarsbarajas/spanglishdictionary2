import React from 'react';

const PostForm = ({header, children, onSubmit, error}) => {
  return (
    <div className='post-form-container'>
      <h1>{header}</h1>
      <form onSubmit={onSubmit}>
        {children}
        <button>submit</button>
      </form>
      { error ? <div className='error'>{error}</div> : null }
    </div>
  );
}

export default PostForm;