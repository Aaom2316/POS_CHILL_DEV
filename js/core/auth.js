window.POS.auth = {
  async session(){
    const {data:{session}} = await POS.supabase.auth.getSession();
    return session;
  },

  async login(email,password){
    const {data,error} = await POS.supabase.auth.signInWithPassword({email,password});
    if(error) throw error;
    return data.user;
  },

  async logout(){
    await POS.supabase.auth.signOut();
  }
};
