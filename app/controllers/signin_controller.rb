class SigninController < ApplicationController

  skip_before_filter :verify_token, except: [:disconnect]

  def index
    # Create a string for verification
    if !session[:state]
      state = (0...13).map{('a'..'z').to_a[rand(26)]}.join
      session[:state] = state
    end
    @state = session[:state]
  end

  def connect
    
    if !session[:token]
      if session[:state] == params[:state]
        responseData = request.body.read

        $authorization.code = responseData.split(',')[0]
        $client.authorization = $authorization
        id_token = responseData.split(',')[1]
        encoded_json_body = id_token.split('.')[1]
        
        encoded_json_body += (['='] * (encoded_json_body.length % 4)).join('')
        json_body = Base64.decode64(encoded_json_body)
        body = JSON.parse(json_body)
        gplus_id = body['sub']
        email = body['email']
        session[:token] = responseData.split(',')[2]
        session[:user_google_id] = gplus_id
        session[:user_email] = email
      else
        render json: 'The client state does not match the server state.'.to_json
      end
    end

    $client.authorization.access_token = session[:token]
    @plus = $client.discovered_api('plus', 'v1')

    response = $client.execute(@plus.people.get,
                              {'userId'=> 'me'}).data

    result = JSON.parse(response.to_json)
    
    if result.has_key?('error')
      $client.authorization.access_token = nil
      reset_session
      render json: result['error'].to_json
    else
      @user = User.find_by(google_id: session[:user_google_id])
      if !@user
        User.join_and_create(session[:user_email], session[:user_google_id])
        render json: result.to_json
      else
        render json: result.to_json
      end
    end
   
  end

  def refresh_connection
      $client.authorization.access_token = nil
      reset_session
      redirect_to root_path
  end

  def disconnect
    # Using either the refresh or access token to revoke if present.
    token = session[:token]
    $client.authorization.access_token = nil
    
    reset_session

    # Sending the revocation request and returning the result.
    revokePath = 'https://accounts.google.com/o/oauth2/revoke?token=' + token
    uri = URI.parse(revokePath)
    request = Net::HTTP.new(uri.host, uri.port)
    request.use_ssl = true
    request.get(uri.request_uri).code

    render json: 'User disconnected.'.to_json
  end

  # def save_user
  #   # Save or find User
  #   @user =  User.find_by(google_id: params[:id])
  #   if @user
  #     session[:user_email] = @user.email
  #     render json: 'User is already saved and email set in session persistUser Endpoint.'.to_json
  #   else
  #     user = User.new(google_id: params[:id], email: params[:email])
  #     if user.save
  #       drive = $client.discovered_api('drive', 'v2')
  #       team_members = TeamMember.all.where(google_id: user.google_id)
  #       if team_members.present?
  #         team_members.each do |team_member|
  #           teamfiles = team_member.circle.team_files
  #           if teamfiles
  #             teamfiles.each do |teamfile|
  #               new_permission = drive.permissions.insert.request_schema.new({
  #                 'value' => user.email,
  #                 'type' => "user",
  #                 'role' => "reader"
  #               })

  #               result = $client.execute(:api_method => drive.permissions.insert,
  #                           :body_object => new_permission,
  #                           :parameters => { 'fileId' => teamfile.file_id })
  #             end
  #           end
  #         end
  #       end
  #       render json: 'newUser is saved persistUser Endpoint..'.to_json
  #     else
  #       render json: 'newUser is not saved EERRROOOORRRR persistUser Endpoint..'.to_json
  #     end
  #   end
  #   session[:user_google_id] = params[:id]
  # end


private

  def check_if_new_user
     

  end

end




