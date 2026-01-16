import json
import os
import psycopg2
import hashlib
import secrets
from datetime import datetime, timedelta
from psycopg2.extras import RealDictCursor

ADMIN_PASSWORD = '1Arbuz1'

def handler(event: dict, context) -> dict:
    '''API для админ-панели: авторизация, управление отзывами и книгами'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'login':
                password = body.get('password')
                
                if password == ADMIN_PASSWORD:
                    session_token = secrets.token_urlsafe(32)
                    expires_at = datetime.now() + timedelta(hours=24)
                    
                    cursor.execute(
                        'INSERT INTO admin_sessions (session_token, expires_at) VALUES (%s, %s)',
                        (session_token, expires_at)
                    )
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'token': session_token, 'message': 'Успешный вход'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Неверный пароль'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
        
        auth_header = event.get('headers', {}).get('Authorization', '')
        token = auth_header.replace('Bearer ', '')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Требуется авторизация'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        cursor.execute(
            'SELECT * FROM admin_sessions WHERE session_token = %s AND expires_at > CURRENT_TIMESTAMP',
            (token,)
        )
        session = cursor.fetchone()
        
        if not session:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Сессия истекла'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action')
            
            if action == 'reviews':
                cursor.execute('''
                    SELECT r.*, b.title as book_title 
                    FROM reviews r 
                    LEFT JOIN books b ON r.book_id = b.id 
                    ORDER BY r.created_at DESC
                ''')
                reviews = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps([dict(r) for r in reviews], ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'books':
                cursor.execute('SELECT * FROM books ORDER BY created_at DESC')
                books = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps([dict(b) for b in books], ensure_ascii=False, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            item_type = body.get('type')
            item_id = body.get('id')
            
            if not item_type or not item_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Необходимо указать тип и ID элемента'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            if item_type == 'review':
                cursor.execute('UPDATE reviews SET status = %s WHERE id = %s', ('rejected', item_id))
            elif item_type == 'book':
                cursor.execute('UPDATE books SET deleted_at = CURRENT_TIMESTAMP WHERE id = %s', (item_id,))
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Неверный тип элемента'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Элемент удалён'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
